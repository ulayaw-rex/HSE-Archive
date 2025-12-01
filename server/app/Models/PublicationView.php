<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicationView extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'ip_address',
    ];
    public function publication()
    {
        return $this->belongsTo(Publication::class, 'publication_id', 'publication_id');
    }
}