<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentHistory extends Model
{
    use HasFactory;

    protected $fillable = ['comment_id', 'body'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}