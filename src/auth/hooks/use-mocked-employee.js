import { _mock } from 'src/_mock';

// To get the employee from the <AuthContext/>, you can use

// Change:
// import { useMockedEmployee } from 'src/auth/hooks';
// const { employee } = useMockedEmployee();

// To:
// import { useAuthContext } from 'src/auth/hooks';
// const { employee } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedEmployee() {
  const employee = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: 'Айдос',
    email: 'demo@biz360.com',
    photoURL: _mock.image.avatar(24),
    phoneNumber: _mock.phoneNumber(1),
    country: _mock.countryNames(1),
    address: 'Ауезова 163',
    state: 'Алматы',
    city: 'Алматинская область',
    zipCode: '050059',
    about: 'Силен!',
    role: 'admin',
    isPublic: true,
  };

  return { employee };
}
