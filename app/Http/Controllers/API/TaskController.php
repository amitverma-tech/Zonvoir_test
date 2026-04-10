<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Services\TaskService;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        return $this->taskService->list(auth()->user(), $filters);
    }

    public function store(StoreTaskRequest $request)
    {
        return $this->taskService->create($request->validated());
    }

    public function show(Task $task)
    {
        if ($task->user_id !== auth()->id())
            abort(403);
        return $task;
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        if ($task->user_id !== auth()->id())
            abort(403);

        return $this->taskService->update($task, $request->validated());
    }

    public function destroy(Task $task)
    {
        if ($task->user_id !== auth()->id())
            abort(403);

        $this->taskService->delete($task);

        return response()->json(['message' => 'Deleted']);
    }
}
