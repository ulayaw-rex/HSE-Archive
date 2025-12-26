<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'action', 'details', 'ip_address'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record($action, $details = null)
    {
        self::create([
            'user_id'    => Auth::id(), 
            'action'     => $action,
            'details'    => $details,
            'ip_address' => Request::ip(), 
        ]);
    }
}