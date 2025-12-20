<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; 

class Publication extends Model
{
    use HasFactory;

    protected $table = 'publications';

    protected $primaryKey = 'publication_id'; 

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'title',
        'byline', 
        'body',
        'views',
        'category',
        'photo_credits',
        'image_path',
        'status',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'publication_id', 'publication_id');
    }

    public function writers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class, 
            'publication_user', 
            'publication_id',   
            'user_id'           
        );
    }
    
}