import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';

export default function SignInbox({ signIn, role }) {
  const theme = useTheme();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSignIn = async () => {
    setError('');  // Clear previous errors
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      await signIn(username, password, role);  // Pass role for dynamic API endpoint
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppProvider theme={theme}>
      <div className="flex flex-col items-center justify-center min-h-fit bg-gray-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Sign In as {role}</h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleSignIn}
            className={`w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition duration-300`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </div>
    </AppProvider>
  );
}



// import * as React from 'react';
// import { AppProvider } from '@toolpad/core/AppProvider';
// import { SignInPage } from '@toolpad/core/SignInPage';
// import { useTheme } from '@mui/material/styles';

// const providers = [{ id: 'credentials', name: 'Username and Password' }];

// export default function SignInbox({signIn}) {
//   const theme = useTheme();
//   return (
//     <AppProvider theme={theme}>
//       <SignInPage
//         signIn={(provider, formData) =>{
//           const username = formData.get('Username')
//           const password= formData.get('password')
//           signIn(username,password)
//         }
         
          
//         }
//         slotProps={{
//           emailField: {label:'Username', variant: 'standard' },
//           passwordField: { variant: 'standard' },
//           submitButton: { variant: 'outlined' },
//         }}
//         providers={providers}
//       />
//     </AppProvider>
//   );
// }
