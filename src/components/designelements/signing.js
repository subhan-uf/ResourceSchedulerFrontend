import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const providers = [{ id: 'credentials', name: 'Username and Password' }];

export default function SignInbox({ signIn }) {
  const theme = useTheme();
  const [username, setUsername] = React.useState(''); // State for username
  const [password, setPassword] = React.useState(''); // State for password

  const handleSignIn = () => {
    signIn(username, password); // Pass username and password to the signIn function
  };

  return (
    <AppProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {/* Custom Username Field */}
        <TextField
          label="Username"
          variant="standard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />

        {/* Custom Password Field */}
        <TextField
          label="Password"
          type="password"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        {/* Submit Button */}
        <Button variant="outlined" onClick={handleSignIn} fullWidth>
          Sign In
        </Button>
      </Box>
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
