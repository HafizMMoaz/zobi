import { createRef, PureComponent } from 'react';
import { styled } from '@zobi/core/theme';
import {
  ModalTrigger,
  ModalTriggerRef,
} from '@zobi-ui/core/components/ModalTrigger';
import FilterScope from 'src/dashboard/containers/FilterScope';

type FilterScopeModalProps = {
  triggerNode: JSX.Element;
};

const FilterScopeModalBody = styled.div(({ theme: { sizeUnit } }) => ({
  padding: sizeUnit * 2,
  paddingBottom: sizeUnit * 3,
}));

export default class FilterScopeModal extends PureComponent<
  FilterScopeModalProps,
  {}
> {
  modal: ModalTriggerRef;

  constructor(props: FilterScopeModalProps) {
    super(props);

    this.modal = createRef() as ModalTriggerRef;
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleCloseModal(): void {
    this?.modal?.current?.close?.();
  }

  render() {
    const filterScopeProps = {
      onCloseModal: this.handleCloseModal,
    };

    return (
      <ModalTrigger
        ref={this.modal}
        triggerNode={this.props.triggerNode}
        modalBody={
          <FilterScopeModalBody>
            <FilterScope {...filterScopeProps} />
          </FilterScopeModalBody>
        }
        width="80%"
      />
    );
  }
}
