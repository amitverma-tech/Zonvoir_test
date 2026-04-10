<?php

namespace App\Services;

use App\Repositories\Interfaces\TaskRepositoryInterface;

class TaskService
{
    protected $repo;

    public function __construct(TaskRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function list($user, array $filters = [])
    {
        return $this->repo->getAll($user, $filters);
    }

    public function create(array $data)
    {
        return $this->repo->create($data);
    }

    public function update($task, array $data)
    {
        return $this->repo->update($task, $data);
    }

    public function delete($task)
    {
        return $this->repo->delete($task);
    }
}