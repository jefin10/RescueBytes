const Login = () => {
  return (
    <div className='h-screen flex items-center justify-center bg-gray-50 '>
        <div className='bg-white p-10 rounded-xl border-2 border-gray-200 w-full max-w-md'>
            <h1 className='text-3xl font-bold text-center mb-4'>RescueBytez</h1>
            <h1 className='text-3xl font-semibold text-center text-gray-700 mb-4'>Login</h1>
            <form className='flex flex-col my-2'>
                <div className='Username flex flex-col mb-1 '>
                    <label htmlFor='username mb-1'>Username</label>
                <div className='Username flex flex-col mb-1 '>
                    <label htmlFor='username' className='mb-1'>Username</label>
                    <input type='text' id='username' name='username' className='border-1 border-gray-300 rounded-2xl pl-2' placeholder='kottayam@email.com' title='Username input field' />
                </div>
                <div className='Password flex flex-col my-2 mb-1'>
                    <label htmlFor='password' className='mb-1'>Password</label>
                    <input type='password' id='password' name='password' className='border-1 border-gray-300 rounded-2xl pl-2' placeholder='12345678' title='Password input field'/>
                </div>
                </div>

            </form>
        </div>
    </div>
  )
}

export default Login