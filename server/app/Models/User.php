<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany; 
use Illuminate\Database\Eloquent\Relations\BelongsToMany; 

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_HILLSIDER = 'hillsider';
    const ROLE_ALUMNI = 'alumni';
    const ROLE_ADMIN = 'admin';

    protected $table = 'users';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
        'course',
        'year_graduated',
        'position',
        'status',
        'avatar',   
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
    
    public function publications(): BelongsToMany
    {
        return $this->belongsToMany(
            Publication::class, 
            'publication_user', 
            'user_id',          
            'publication_id'  
        );
    }
}