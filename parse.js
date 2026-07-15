const fs = require('fs');

const rollStr = `727824TUIT001
727824TUIT002
727824TUIT003
727824TUIT004
727824TUIT005
727824TUIT006
727824TUIT007
727824TUIT008
727824TUIT009
727824TUIT010
727824TUIT011
727824TUIT012
727824TUIT013
727824TUIT014
727824TUIT015
727824TUIT016
727824TUIT017
727824TUIT018
727824TUIT019
727824TUIT020
727824TUIT021
727824TUIT022
727824TUIT023 
727824TUIT024
727824TUIT025
727824TUIT026
727824TUIT027
727824TUIT028
727824TUIT029
727824TUIT030
727824TUIT031
727824TUIT032
727824TUIT033
727824TUIT034
727824TUIT035
727824TUIT036
727824TUIT037
727824TUIT038
727824TUIT039
727824TUIT040
727824TUIT041
727824TUIT042
727824TUIT043
727824TUIT044
727824TUIT045
727824TUIT046
727824TUIT047
727824TUIT048
727824TUIT049
727824TUIT050
727824TUIT051
727824TUIT052
727824TUIT053
727824TUIT054
727824TUIT055
727824TUIT056
727824TUIT057
727824TUIT058
727824TUIT059
727825TUIT602
727825TUIT603
727825TUIT604
727824tuit214`;

const phoneStr = `8072654818
9042059126
9944153519
9786478493
9095056349
8903413308
9443745600
9382618660
9047889619
8973820746
9965312843
7868086675
9443715423
9442764007
8695376080
8925124068
9942227987
9843247303
9942775720

6381683123
9944684142
9159170300
9003385557
6374681581
9486888654
-
9842650825
9943715491
9943137170
-
9943508753
7010639005
9965124646
9843046578
9790411155
9942033344
9865528990
9965569512
6382346425
9787240392
9944154843
8015691803
8525013270
-
9840071706
9655280535
9003119826
8547177517
9976628739
9443124662
6585915716
8220014301
9976261189
9443201719
6383360382
9443524633
8870621564
9894651881
9659840978
9791930590
9788627430
7708630984`;

const nameStr = `ABDUL
Abhinav
ABISHA
ABISHEK
ABISHEK
ADEEB
ADHITYA
AJAY
Alagumaris
Amrisha 
Amritha
Anand 
Ananya 
ANBUSELVAN
Anisha
Arasan
INIYABHARATHI
Arun Prasath
Ashwanth
Janani 
Aswath
Aswen
Aswin 
Athesh 
Athish
Balamanikandan 
Barath
Bragadeesh 
Darshini
Deepak 
Deepika
Deepthasri
Dhanusha
Dhanyasri
 Dharrshinii
Dharshini
DHARUN
Dharunika 
Dhisiharan
DHIYANESHWAR 
Dineshkumar
Dinesh
Divya
Divyadharshini
Divyasagar
Edwin 
Gokul
Gopinath
Gowsik
Gowtham Peiyasamy 
GURU VISHAL
Guruchandru 
Hari 
Hari
Hariraj
Harish 
Harish kumar
Harsha
Iniya 
karthik 

LOGESWARAN
Shagul`;

const rolls = rollStr.split('\n').map(s => s.trim()).filter(s => s !== '');
const names = nameStr.split('\n').map(s => s.trim()).filter(s => s !== '');

// Phones has empty line after 19th item, and '-'
// Actually let's just split by newline and trim.
const rawPhones = phoneStr.split('\n').map(s => s.trim());
// Let's filter out empty lines to see if it matches exactly 63.
let phones = rawPhones.filter(s => s !== '');
if (phones.length < rolls.length) {
    // maybe we just map them sequentially and if missing, leave it.
    // wait, phones has 62 items. Rolls has 63 items. Names has 63 items (if we count karthik, logeswaran, shagul).
}

const students = [];
for(let i=0; i<rolls.length; i++) {
  students.push({
    roll_no: rolls[i].toUpperCase(),
    name: names[i] || '',
    parent_phone: (phones[i] && phones[i] !== '-') ? phones[i] : null
  });
}

fs.writeFileSync('studentsE.json', JSON.stringify(students, null, 2));
console.log("Done generating studentsE.json. Length:", students.length);
