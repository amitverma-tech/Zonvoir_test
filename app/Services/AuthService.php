<?php


namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data)
    {
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        $token = $user->createToken('token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user
        ];
    }

    public function login(array $data)
    {
        if (!Auth::attempt($data)) {
            abort(401, 'Invalid credentials');
        }

        $user = Auth::user();

        $token = $user->createToken('token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user
        ];
    }

    public function logout($user)
    {
        $user->tokens()->delete();

        return ['message' => 'Logged out'];
    }
}