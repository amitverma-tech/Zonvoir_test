<?php


namespace App\Repositories\Interfaces;

interface TaskRepositoryInterface
{
    public function getAll($user, array $filters = []);
    public function create(array $data);
    public function update($task, array $data);
    public function delete($task);
}