<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; 

class Publication extends Model
{
    use HasFactory;

    protected $table = 'publications';

    protected $primaryKey = 'publication_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'byline',
        'body',
        'views',
        'category',
        'photo_credits',
        'image_path',
    ];


    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'publication_id', 'publication_id');
    }
}