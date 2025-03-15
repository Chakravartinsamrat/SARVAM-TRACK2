import React from 'react';
import { Link, Form, useNavigation, useActionData } from 'react-router-dom';

import { useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import TextField from '../components/TextField';
import { Button } from '../components/Button';
import { CircularProgress, LinearProgress } from '../components/Progress';
import Logo from '../components/Logo';

//animation
import { AnimatePresence } from 'framer-motion';

//assests
import { banner } from '../assets/assets';

//Custom Hook for Snackbar
import { useSnackbar } from '../hooks/useSnackbar';

const Login = () => {
  //get error data from form using useAtciondata
  const error = useActionData();
  console.log(error);
  //get navigation from submitting and loading
  const navigation = useNavigation();

  const { showSnackBar } = useSnackbar();

  useEffect(() => {
    //show snackbar with the same error messages
    if (error?.message) {
      showSnackBar({
        message: error.message,
        type: 'error',
      });
    }
  }, [error, showSnackBar]);

  return (
    <>
      <PageTitle title='Login' />
      <div className='relative w-screen h-dvh p-2 grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] lg:gap-2'>
        <div className='flex flex-col p-4'>
          <Logo classes='mb-auto sm:mx-auto lg:mx-0'/>

          {/* <Link
            to='/'
            className='max-w-max '
          >
            <img
              src={logoLight}
              alt='synchat logo'
              width={133}
              height={24}
              className='dark:hidden'
            />
            <img
              src={logoDark}
              alt='synchat logo'
              width={133}
              height={24}
              className='hidden dark:block'
            />
          </Link> */}

          <div className='flex flex-col gap-2 max-w-[480px] mx-auto w-full'>
            <h2 className='text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground text-center'>
              Welcome Back To Synchat
            </h2>
            <p className='text-bodyLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2'>
              Enter Your Account Details
            </p>
            <Form
              method='POST'
              className='grid grid-cols-1 gap-4'
            >
              <TextField
                type='email'
                name='email'
                label='Email'
                placeholder='Email'
                required={true}
                autoFocus={true}
              />
              <TextField
                type='password'
                name='password'
                label='Password'
                placeholder='Enter your password'
                required={true}
              />

            <div className='text-right'>
                <Link to = '/reset-link' className='link text-labelLarge inline-block'>Forgot Password?</Link>
            </div>

              <Button
                type='submit'
                disabled={navigation.state === 'submitting'}
              >
                {navigation.state === 'submitting' ? (
                  <CircularProgress size='small' />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>
            <p className='text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-center'>
              Don&apos;t have an account?
              <Link
                to='/register'
                className='link text-labelLarge inline-block ms-1 text-light-onSurface dark:text-dark-onSurface'
              >
                Create an account
              </Link>
            </p>
          </div>
          <p className='mt-auto mx-auto text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-bodyMedium lg:mx-0'>
            &copy; 2025 Piyush.C. All rights reserved.
          </p>
        </div>

        <div className='hidden lg:block lg:relative lg:rounded-large img-box'>
          <img
            src={banner}
            alt='synchat banner'
            className='img-cover'
          />
          <p className='absolute bottom-10 left-12 right-12 z-10 text-displayLarge font-semibold leading-tight text-right text-light-onSurface drop-shadow-sm 2xl:text-[72px]'>
            Chat with SynChat to supercharge your ideas.
          </p>
        </div>
      </div>
      <AnimatePresence>
        {navigation.state === 'loading' && (
          <LinearProgress classes='absolute top-0 left-0 right-0' />
        )}
      </AnimatePresence>
    </>
  );
};

export default Login;
