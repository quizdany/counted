CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`merchant` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`type` text DEFAULT 'Expense' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
