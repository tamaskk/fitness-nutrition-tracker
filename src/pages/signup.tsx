import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { Button } from '@/component/Button';
import { TextField, SelectField, DateField, NumberField } from '@/component/Fields';
import { Logo } from '@/component/Logo';
import { SlimLayout } from '@/component/SlimLayout';
import { RegisterFormData } from '@/types';
import { countries } from 'countries-list';

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const signupData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        language: data.language,
        ...(data.birthday && { birthday: data.birthday }),
        ...(data.gender && { gender: data.gender }),
        ...(data.weight && { weight: data.weight }),
        ...(data.height && { height: data.height }),
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store registration data in sessionStorage for onboarding flow
        sessionStorage.setItem('registrationData', JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        }));
        
        toast.success('Account created successfully! Let\'s set up your preferences.');
        router.push('/onboarding/preferences');
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900 dark:text-white">
        Create your account
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign in
        </Link>{' '}
        to your existing account.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid grid-cols-1 gap-y-8">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <TextField
              label="First name"
              type="text"
              autoComplete="given-name"
              required
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters',
                },
              })}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <TextField
              label="Last name"
              type="text"
              autoComplete="family-name"
              required
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters',
                },
              })}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            required
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Country and Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SelectField
              label="Country"
              required
              {...register('country', {
                required: 'Country is required',
              })}
            >
              <option value="">Select country</option>
              {Object.entries(countries)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([code, country]) => (
                  <option key={code} value={code}>
                    {country.name}
                  </option>
                ))}
            </SelectField>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>
          <div>
            <SelectField
              label="Language"
              required
              {...register('language', {
                required: 'Language is required',
              })}
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="nl">Dutch</option>
              <option value="hu">Hungarian</option>
              <option value="es">Spanish</option>
              <option value="pt">Portuguese</option>
            </SelectField>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>
        </div>

        {/* Birthday and Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <DateField
              label="Birthday"
              required
              {...register('birthday', {
                required: 'Birthday is required',
              })}
            />
            {errors.birthday && (
              <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
            )}
          </div>
          <div>
            <SelectField
              label="Gender"
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </SelectField>
          </div>
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Weight
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <NumberField
                  label=""
                  placeholder="Enter weight"
                  {...register('weight.value', {
                    min: { value: 1, message: 'Weight must be at least 1' },
                    max: { value: 1000, message: 'Weight must be less than 1000' },
                  })}
                />
              </div>
              <div className="w-20">
                <SelectField
                  label=""
                  {...register('weight.unit')}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </SelectField>
              </div>
            </div>
            {errors.weight?.value && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.value.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Height
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <NumberField
                  label=""
                  placeholder="Enter height"
                  {...register('height.value', {
                    min: { value: 1, message: 'Height must be at least 1' },
                    max: { value: 300, message: 'Height must be less than 300' },
                  })}
                />
              </div>
              <div className="w-20">
                <SelectField
                  label=""
                  {...register('height.unit')}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </SelectField>
              </div>
            </div>
            {errors.height?.value && (
              <p className="mt-1 text-sm text-red-600">{errors.height.value.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div>
          <Button 
            type="submit" 
            variant="solid" 
            color="blue" 
            className="w-full"
            disabled={isLoading}
          >
            <span>
              {isLoading ? 'Creating account...' : 'Create account'} <span aria-hidden="true">&rarr;</span>
            </span>
          </Button>
        </div>
      </form>
    </SlimLayout>
  );
}