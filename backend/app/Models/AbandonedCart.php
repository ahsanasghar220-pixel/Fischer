<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model {
    protected $fillable = ["user_id", "email", "session_id", "cart_data", "cart_total", "last_activity_at", "reminder_sent", "reminder_sent_at", "is_recovered"];
    protected $casts = ["cart_data" => "array", "is_recovered" => "boolean", "reminder_sent" => "boolean", "last_activity_at" => "datetime", "reminder_sent_at" => "datetime"];
}
