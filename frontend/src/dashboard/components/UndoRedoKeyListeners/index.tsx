import { PureComponent } from 'react';
import { HeaderProps } from '../Header/types';

type UndoRedoKeyListenersProps = {
  onUndo: HeaderProps['onUndo'];
  onRedo: HeaderProps['onRedo'];
};

class UndoRedoKeyListeners extends PureComponent<UndoRedoKeyListenersProps> {
  constructor(props: UndoRedoKeyListenersProps) {
    super(props);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown(event: KeyboardEvent) {
    const controlOrCommand = event.ctrlKey || event.metaKey;
    if (controlOrCommand) {
      const isZChar = event.key === 'z' || event.keyCode === 90;
      const isYChar = event.key === 'y' || event.keyCode === 89;
      const isEditingMarkdown = document?.querySelector(
        '.dashboard-markdown--editing',
      );
      const isEditingTitle = document?.querySelector(
        '.editable-title--editing',
      );

      if (!isEditingMarkdown && !isEditingTitle && (isZChar || isYChar)) {
        event.preventDefault();
        const func = isZChar ? this.props.onUndo : this.props.onRedo;
        func();
      }
    }
  }

  render() {
    return null;
  }
}

export default UndoRedoKeyListeners;
