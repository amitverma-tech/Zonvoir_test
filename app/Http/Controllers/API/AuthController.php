<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\AuthService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;

class AuthController extends Controller
{

    public function __construct(private AuthService $authService)
    {

    }

    public function register(RegisterRequest $request)
    {
        return response()->json(
            $this->authService->register($request->validated())
        );
    }

    public function login(LoginRequest $request)
    {
        return response()->json(
            $this->authService->login($request->validated())
        );
    }

    public function logout()
    {
        return response()->json(
            $this->authService->logout(auth()->user())
        );
    }

}
