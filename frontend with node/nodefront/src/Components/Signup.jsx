function
 
SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  
const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your signup logic here
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      
<div
 
className="max-w-md w-full space-y-8">

        
<h2
 
className="text-3xl font-semibold text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Individual input fields */}
          <Input
 
label="First Name"
 
type="text"
 
value={firstName}
 


onChange={(e) => setFirstName(e.target.value)} />


          <Input
 
label="Last Name"
 
type="text"
 
value={lastName}
 
onChange={(e) => setLastName(e.target.value)} />


          <Input
 
label="Email"
 
type="email"
 
value={email}
 
onChange={(e) => setEmail(e.target.value)} />
          <Input
 
label="Password"
 
type="password"
 
value={password}
 
onChange={(e) => setPassword(e.target.value)} />
          <Input
 
label="Confirm Password"
 
type="password"
 
value={confirmPassword}
 
onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" className="mt-4 w-full rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-700">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}