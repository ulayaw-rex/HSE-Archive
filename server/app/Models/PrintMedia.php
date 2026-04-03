<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrintMedia extends Model
{
    use HasFactory, SoftDeletes;

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
        'file_path',
        'original_filename',
        'thumbnail_path',
        'date_published'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function owners()
    {
        return $this->belongsToMany(
            User::class, 
            'print_media_owners', 
            'print_media_id',     
            'user_id'             
        );
    }

    public function requests()
    {
        return $this->morphMany(CreditRequest::class, 'requestable');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}