<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany; 
use Illuminate\Database\Eloquent\Relations\BelongsToMany; 

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

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

    // ── Role & Position Helpers ────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isEditorInChief(): bool
    {
        return str_contains(strtolower($this->position ?? ''), 'chief');
    }

    public function isAssociateEditor(): bool
    {
        return str_contains(strtolower($this->position ?? ''), 'associate');
    }

    public function isDirector(): bool
    {
        return str_contains(strtolower($this->position ?? ''), 'director');
    }

    public function isEditor(): bool
    {
        return str_contains(strtolower($this->position ?? ''), 'editor');
    }

    /**
     * Users with editorial oversight: admin, EIC, associate editors, directors.
     */
    public function isManagement(): bool
    {
        return $this->isAdmin() || $this->isEditorInChief() || $this->isAssociateEditor() || $this->isDirector();
    }

    /**
     * Can this user review/approve content? (editor-level or above)
     */
    public function isEditorial(): bool
    {
        return $this->isAdmin() || $this->isEditor() || $this->isDirector();
    }

    // ── Relationships ────────────────────────────────────

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

    /**
     * Send the email verification notification in the background.
     */

}