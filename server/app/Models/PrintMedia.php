<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrintMedia extends Model
{
    use HasFactory;

    protected $table = 'print_media';

    protected $primaryKey = 'print_media_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'type',
        'date',
        'description',
        'byline',
        'image_path',
        'file_path',
    ];
}
