import { supabase } from '@/config/supabase/supabaseClient.ts'
import { Button } from '@/lib/shadcn-components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/config/router/routes.ts'
import { FormInput } from '@/components/form/FormInput.tsx'
import { useRegisterForm } from './utils/useRegisterForm'
import { socialLogo } from '@/static/images.ts'
import { Tables } from '@/model/dbTypes.ts'
import { useToast } from '@/lib/shadcn-components/ui/use-toast.ts'
import { mapSupabaseAuthError } from '@/utils/supabaseErrorMappers.ts'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { register, handleSubmit, errors } = useRegisterForm()

  const handleFormSubmit = handleSubmit((values) => {
    supabase.auth
      .signUp({
        email: values.EMAIL,
        password: values.PASSWORD,
      })
      .then((res) => {
        console.log(res)
        if (!res.data.user?.id) return

        const user: Tables<'USER'> = {
          id: String(res.data.user.id),
          USERNAME: String(values.USERNAME),
          EMAIL: String(res.data.user.email),
          FIRST_NAME: String(values.FIRST_NAME),
          LAST_NAME: String(values.LAST_NAME),
          BACKGROUND_COLOR: 'white',
        }

        return supabase.from('USER').insert(user)
      })
      .then((res) => {
        if (res?.error) {
          const error = mapSupabaseAuthError(res.error.message)

          toast({
            title: 'Error occurred',
            description: error,
            duration: 5000,
            variant: 'destructive',
          })
        } else {
          navigate(APP_ROUTES.accountConfirmation)
        }
      })
  })

  return (
    <form onSubmit={handleFormSubmit} className={'flex flex-col gap-7 self-center w-full'}>
      <img alt={'social logo'} src={socialLogo} className={'w-1/2 self-center'} />
      <div className={'flex flex-col gap-3.5'}>
        <FormInput label="Email" placeholder="Enter email" {...register('EMAIL')} error={errors.EMAIL?.message} />
        <FormInput
          label="Username"
          placeholder="Enter username"
          {...register('USERNAME')}
          error={errors.USERNAME?.message}
        />
        <FormInput
          label="Name"
          placeholder="Enter name"
          {...register('FIRST_NAME')}
          error={errors.FIRST_NAME?.message}
        />
        <FormInput
          label="Surname"
          placeholder="Enter surname"
          {...register('LAST_NAME')}
          error={errors.LAST_NAME?.message}
        />
        <FormInput
          label="Password"
          placeholder="******"
          type="password"
          {...register('PASSWORD')}
          error={errors.PASSWORD?.message}
        />
      </div>

      <div className={'flex w-full gap-3.5 md:flex-row-reverse flex-col-reverse'}>
        <Button className={'md:flex-1'} type="submit">
          Register
        </Button>
        <Link to={APP_ROUTES.login} className={'md:w-[75%]'}>
          <Button className={'w-full'} variant={'secondary'}>
            Already have an account? Log in here
          </Button>
        </Link>
      </div>
    </form>
  )
}
