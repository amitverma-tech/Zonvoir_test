<?php


namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Interfaces\TaskRepositoryInterface;

class TaskRepository implements TaskRepositoryInterface
{
    public function getAll($user, array $filters = [])
    {
        $query = $user->tasks()->latest();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate(10);
    }

    public function create(array $data)
    {
        return auth()->user()->tasks()->create($data);
    }

    public function update($task, array $data)
    {
        $task->update($data);
        return $task;
    }

    public function delete($task)
    {
        return $task->delete();
    }
}