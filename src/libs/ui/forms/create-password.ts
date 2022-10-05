import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { UseFormProps } from 'react-hook-form/dist/types/form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import {
  usePasswordRule,
  useConfirmPasswordRule
} from '@libs/ui/forms/form-validation-rules';

export function useCreatePasswordForm() {
  const formSchema = Yup.object().shape({
    password: usePasswordRule(),
    confirmPassword: useConfirmPasswordRule('password')
  });

  const formOptions: UseFormProps = {
    reValidateMode: 'onChange',
    resolver: yupResolver(formSchema)
  };

  return useForm(formOptions);
}
