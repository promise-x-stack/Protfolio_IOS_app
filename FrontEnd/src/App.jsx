import LandingPage from './Components/Landing_page/Landing'
import MassagePage from './Components/message/message'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App(){

  const route =createBrowserRouter([
    {path:"/", element:<LandingPage/>},
    {path:"/message", element:<MassagePage/>},
  ])

  return (
    <>
        <RouterProvider router={route}/>
    </>
  )
}

export default App
