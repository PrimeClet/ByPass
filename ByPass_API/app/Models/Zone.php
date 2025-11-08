<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Zone extends Model
{
    use HasFactory, Notifiable; use HasApiTokens;

    protected $guarded = [];

    public function equipements() {
        return $this->hasMany(Equipment::class);
    }
}
