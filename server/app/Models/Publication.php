<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'category',
        'photo_credits',
        'image_path',
    ];
}
