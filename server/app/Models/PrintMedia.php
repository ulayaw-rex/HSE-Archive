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
        'user_id',
        'title',
        'type',
        'description',
        'byline',
        'date',
        'file_path',
        'original_filename',
        'thumbnail_path',
        'image_path',
        'date_published'
    ];

    protected $casts = [
        'date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

