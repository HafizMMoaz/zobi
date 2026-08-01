import { Form as AntdForm } from 'antd';
import { FormProps } from './types';

function CustomForm(props: FormProps) {
  return <AntdForm {...(props as any)} />;
}

export const Form = Object.assign(CustomForm, {
  useForm: AntdForm.useForm,
  Item: AntdForm.Item,
  List: AntdForm.List,
  ErrorList: AntdForm.ErrorList,
  Provider: AntdForm.Provider,
});
