## Running the script

```
forever start --spinSleepTime 86400 app.js
```

The spinSleepTime makes sure that the app can keep up for 24 hours even without running any script. [Cron](https://github.com/ncb000gt/node-cron) is set to start a new call at 2 AM (UTC time) every day.

## Mongo DB

### Export

DON'T CONNECT TO A DATABASE!  
After running mongo, open a new terminal window and then:

```
mongoexport -d autocomplete -c records -o path/autocomplete.json --jsonArray
```

### AND queries

* Different properties:

```
db.records.find({'date': {'$gt': dia1}, 'domain': 'google.dz'})
```

* Same property (range):

```
var start = new Date('2015-02-22T11:23:00.000Z')
var stop = new Date('2015-02-22T16:35:00.000Z')

db.records.count({'date':{'$gte':start, '$lt':stop}, 'domain': 'google.dz'})
```

### Updating dates

```
var dia1 = new Date('2015-02-19T02:00:00.000Z')  
var dia2 = new Date('2015-02-20T02:00:00.000Z')  
db.records.update({'date': {'$gt': dia1}}, {'$set': {'date': dia2} }, {multi: true})
// {multi: true} updates multiple documents at once
```

