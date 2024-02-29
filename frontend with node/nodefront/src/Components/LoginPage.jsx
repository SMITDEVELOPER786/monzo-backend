import { useState } from "react";





function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = (e) => {
      e.preventDefault();
      // Implement your login logic here
    };
  
    return (
      <div className="min-h-screen h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  
        
  <div
   
  className="max-w-md w-full space-y-8">
  
          
  <h2
   
  className="text-3xl font-semibold text-center">Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              className="rounded-md border px-3 py-2 text-gray-700 focus:border-blue-500 focus:text-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password" className="mt-4 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="rounded-md border px-3 py-2 text-gray-700 focus:border-blue-500 focus:text-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            < type="submit" className="mt-4 w-full rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-700">
              Login
            </>


            <button type="button" className="mt-4 w-full rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-700">
              Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  export default LoginPage;