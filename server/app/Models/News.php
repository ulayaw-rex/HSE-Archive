<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $table = 'news';

    protected $primaryKey = 'news_id';

    public $incrementing = true;

    protected $fillable = [
        'title',
        'excerpt',
        'image_url',
        'href',
        'date',
        'content',
        'views',
    ];
}


