const { sequelize, Student } = require('./db');

const studentPhonesList = [
  { roll_no: '727824TUIT001', name: 'ABDUL SHIYAM A', phone: '7010435581' },
  { roll_no: '727824TUIT002', name: 'Abhinav barath SS', phone: '9698765289' },
  { roll_no: '727824TUIT003', name: 'ABISHA CS', phone: '8300144602' },
  { roll_no: '727824TUIT004', name: 'ABISHEK B', phone: '9025840034' },
  { roll_no: '727824TUIT005', name: 'ABISHEK R', phone: '9080746357' },
  { roll_no: '727824TUIT006', name: 'ADEEB AHAMED M', phone: '6369921659' },
  { roll_no: '727824TUIT007', name: 'ADHITYA N', phone: '6369625570' },
  { roll_no: '727824TUIT008', name: 'AJAY K', phone: '9382618660' },
  { roll_no: '727824TUIT009', name: 'Alagumaris G', phone: '9087429619' },
  { roll_no: '727824TUIT010', name: 'Amrisha J', phone: '8973820746' },
  { roll_no: '727824TUIT011', name: 'Amritha S', phone: '6381551588' },
  { roll_no: '727824TUIT012', name: 'Anand Sanjay M', phone: '8667796585' },
  { roll_no: '727824TUIT013', name: 'Ananya R', phone: '9345309909' },
  { roll_no: '727824TUIT014', name: 'ANBUSELVAN.B', phone: '9442764007' },
  { roll_no: '727824TUIT015', name: 'Anisha S', phone: '8838069464' },
  { roll_no: '727824TUIT016', name: 'ARASAN R', phone: '9345147319' },
  { roll_no: '727824TUIT017', name: 'INIYABHARATHI M', phone: '7708107987' },
  { roll_no: '727824TUIT018', name: 'Arun Prasath M', phone: '8870813504' },
  { roll_no: '727824TUIT019', name: 'Ashwanth S', phone: '9363306234' },
  { roll_no: '727824TUIT020', name: 'JANANI A', phone: '9843755667' },
  { roll_no: '727824TUIT021', name: 'Aswath S', phone: '9363646370' },
  { roll_no: '727824TUIT022', name: 'Aswen S', phone: '8637486991' },
  { roll_no: '727824TUIT023', name: 'Aswin S', phone: '6374197025' },
  { roll_no: '727824TUIT024', name: 'Athesh S', phone: '7200073947' },
  { roll_no: '727824TUIT025', name: 'Athish D', phone: '6385322412' },
  { roll_no: '727824TUIT026', name: 'Balakmanikandan S S', phone: '9025743086' },
  { roll_no: '727824TUIT027', name: 'Barath S', phone: '9626090283' },
  { roll_no: '727824TUIT028', name: 'Bragadeesh P', phone: '7598489646' },
  { roll_no: '727824TUIT029', name: 'DARSHINI B', phone: '8838489102' },
  { roll_no: '727824TUIT030', name: 'DEEPAK S', phone: '9489890489' },
  { roll_no: '727824TUIT031', name: 'DEEPIKA S S', phone: '9629890868' },
  { roll_no: '727824TUIT032', name: 'DEEPTHASRI S D', phone: '8610579655' },
  { roll_no: '727824TUIT033', name: 'DHANUSHA P', phone: '9488217675' },
  { roll_no: '727824TUIT034', name: 'DHANYASRI J', phone: '7824931456' },
  { roll_no: '727824TUIT035', name: 'DHARRSHINII S U', phone: '9042246578' },
  { roll_no: '727824TUIT036', name: 'DHARSHINI S', phone: '9597663333' },
  { roll_no: '727824TUIT037', name: 'DHARUN PRASATH B', phone: '8754026893' },
  { roll_no: '727824TUIT038', name: 'Dharunika T', phone: '9585581765' },
  { roll_no: '727824TUIT039', name: 'DHISIHARAN P', phone: '8248461485' },
  { roll_no: '727824TUIT040', name: 'DHIYANESHWAR K', phone: '9342520816' },
  { roll_no: '727824TUIT041', name: 'DINESHKUMAR G', phone: '9345522895' },
  { roll_no: '727824TUIT042', name: 'DINESH R S', phone: '6385824106' },
  { roll_no: '727824TUIT043', name: 'DIVYA DHARSHINI M', phone: '7092278183' },
  { roll_no: '727824TUIT044', name: 'DIVYADHARSHINI S', phone: '6385860566' },
  { roll_no: '727824TUIT045', name: 'DIVYASAGAR P', phone: '8015443374' },
  { roll_no: '727824TUIT046', name: 'D EDWIN JOSHUA', phone: '9600874706' },
  { roll_no: '727824TUIT047', name: 'GOKUL S', phone: '7871340535' },
  { roll_no: '727824TUIT048', name: 'GOPINATH K', phone: '9025647041' },
  { roll_no: '727824TUIT049', name: 'GOWSIK B', phone: '9345776981' },
  { roll_no: '727824TUIT050', name: 'GOWTHAM PERIYASAMY S', phone: '9943201106' },
  { roll_no: '727824TUIT051', name: 'GURU VISHAL V S', phone: '8525053670' },
  { roll_no: '727824TUIT052', name: 'GURUCHANDRU S', phone: '7339178515' },
  { roll_no: '727824TUIT053', name: 'HARI DARSHINI K', phone: '8098420723' },
  { roll_no: '727824TUIT054', name: 'Hari Prasath M', phone: '9344751241' },
  { roll_no: '727824TUIT055', name: 'Hariraj V', phone: '6382191216' },
  { roll_no: '727824TUIT056', name: 'HARISH ADITHYA C.K', phone: '7200751388' },
  { roll_no: '727824TUIT057', name: 'HARISH KUMAR S V', phone: '8870621564' },
  { roll_no: '727824TUIT058', name: 'HARSHA S', phone: '7397027851' },
  { roll_no: '727824TUIT059', name: 'INIYA K', phone: '6380025923' },
  { roll_no: '727825TUIT601', name: 'KARTHIK SS', phone: '9976684726' },
];

async function updateParentPhones() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    let updatedCount = 0;
    for (const item of studentPhonesList) {
      const student = await Student.findOne({ where: { roll_no: item.roll_no } });
      if (student) {
        await student.update({
          parent_phone: item.phone,
          phone: item.phone
        });
        updatedCount++;
      }
    }

    console.log(`Successfully updated parent phone numbers for ${updatedCount} students of III IT E!`);

    const samples = await Student.findAll({
      where: { section: 'III IT E' },
      order: [['roll_no', 'ASC']],
      limit: 10
    });

    console.log('\n--- Sample Updated Student Records (First 10) ---');
    samples.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.roll_no}] ${s.name} -> Parent Phone: ${s.parent_phone}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating parent phones:', error);
    process.exit(1);
  }
}

updateParentPhones();
