<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MarketingConversionLog extends Model {
    public $timestamps = false;
    protected $fillable = ["platform", "event_type", "order_id", "payload", "response", "status", "error_message"];
    protected $casts = ["payload" => "array", "response" => "array", "created_at" => "datetime"];
}
