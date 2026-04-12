
# How to use liquibase scripts

The main file db.changelog-master.yaml is used to track all incremental database changes over time (so it is the file you typically use for long-term database change management).
A temporary changelog file allows you to run ad-hoc SQL scripts without permanently modifying the main changelog. This is useful when you need to perform a single temporary change to the database that shouldn’t be part of the main sequence of updates.

# When to use it:

    If you need to apply an urgent fix to a database without changing the normal flow of Liquibase updates.
    When you want to run a script that doesn’t belong to the usual database changes but has a temporary necessity.
    When you want to test an SQL script in a specific environment without making permanent changes to the changelog.

# db.changelog-master.yaml
```
databaseChangeLog:
  - changeSet:
      id: 1
      author: your_name
      changes:
        - sqlFile:
            path: classpath:/db/migrations/script1.sql
            relativeToChangelogFile: true

 mvn liquibase:update
```


# db.changelog-single.sql.yaml
```
databaseChangeLog:
  - changeSet:
      id: 1
      author: your_name
      changes:
        - sqlFile:
            path: classpath:/db/migrations/temporary_script.sql
            relativeToChangelogFile: true


 mvn liquibase:update -Dliquibase.changeLogFile=src/main/resources/db/changelog/db.changelog-single.sql.yaml
```