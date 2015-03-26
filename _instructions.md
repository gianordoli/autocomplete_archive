## Running the script

```
$ forever start --minUptime 240000 --spinSleepTime 86400000 app.js
```

The spinSleepTime makes sure that the app can keep up for 24 hours even without running any script. [Cron](https://github.com/ncb000gt/node-cron) is set to start a new call at 2 AM (UTC time) every day.

## Mongo DB

### Backup

#### Export as a binary backup
```
$ mongodump -d autocomplete -c records -o Desktop
```
#### Import binary backup
```
mongorestore -d 5w_1h -c records --drop /Users/gabrielgianordoli/Desktop/_BKP/server/5w_1h/records.bson
```
*--drop* will erase all collections previously stored in the database before importing.

### Export/Import small sets

#### Export JSON file

DON'T CONNECT TO A DATABASE!  
After running mongo, open a new terminal window and then:

```
$ mongoexport -d autocomplete -c records -o path/autocomplete.json --jsonArray
```

#### Exporting with date query

```
$ var day2 = new Date('2015-02-19T05:00:00.000Z')
$ print(day2.getTime())
> 1424322000000
$ mongoexport -d autocomplete -c records -q "{date:{\$lte:new Date(1424322000000)}}" -o desktop/autocomplete_day1.json --jsonArray
```

#### Import JSON file (limited to 16 MB)
```
$ mongoimport -d autocomplete -c records -file path/filename.json --jsonArray
```


### AND queries

* Different properties:

```
$ db.records.find({'date': {'$gt': day1}, 'domain': 'google.dz'})
```

* Same property (range):

```
$ var start = new Date('2015-02-22T11:23:00.000Z')
$ var stop = new Date('2015-02-22T16:35:00.000Z')
$ db.records.count({'date':{'$gte':start, '$lt':stop}, 'domain': 'google.dz'})
```

### Updating dates

```
$ var day1 = new Date('2015-02-19T02:00:00.000Z')  
$ var day2 = new Date('2015-02-20T02:00:00.000Z')  
$ db.records.update({'date': {'$gt': day1}}, {'$set': {'date': day2} }, {multi: true})
// {multi: true} updates multiple documents at once
```