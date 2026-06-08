/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')
  Route.post('/refresh', 'AuthController.refresh').middleware('auth')
  Route.get('/google/redirect', 'AuthController.redirectToGoogle')
  Route.get('/google/callback', 'AuthController.handleGoogleCallback')
}).prefix('/auth')

Route.group(() => {
  Route.post('/leave-requests', 'LeaveRequestsController.store')
}).middleware('auth')

Route.group(() => {
  Route.get('/test-dashboard', async () => {
    return { success: true, message: 'Selamat datang di Ruang Rahasia Admin!' }
  })
})
  .prefix('/admin')
  .middleware(['auth', 'role:admin'])
