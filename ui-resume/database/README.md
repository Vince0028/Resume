# Database

This folder contains the MySQL database schema for the resume project.

## Setup

1. Make sure MySQL is installed and running.
2. Run the schema file to create the database and tables:

```sh
mysql -u root -p < schema.sql
```

## Tables

| Table               | Purpose                          |
|---------------------|----------------------------------|
| `chat_messages`     | Stores livechat messages         |
| `guestbook_comments`| Stores guestbook/comment entries |

## Notes

- The NestJS backend uses TypeORM with `synchronize: true` in development, so tables are auto-created.
- In production, run `schema.sql` manually or use TypeORM migrations.
