<?php
header("Content-Type: application/json");

$dbFile = __DIR__ . "/scores.sqlite";

echo json_encode([
    "exists" => file_exists($dbFile),
    "fileWritable" => is_writable($dbFile),
    "dirWritable" => is_writable(__DIR__)
]);
