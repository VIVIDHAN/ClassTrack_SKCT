const { sequelize, Student } = require('./db');

const updatedStudentsE = [
  { roll_no: '727824TUIT001', name: 'ABDUL SHIYAM A', parent_phone: '8072654818', section: 'III IT E' },
  { roll_no: '727824TUIT002', name: 'Abhinav barath SS', parent_phone: '9042059126', section: 'III IT E' },
  { roll_no: '727824TUIT003', name: 'ABISHA CS', parent_phone: '9944153519', section: 'III IT E' },
  { roll_no: '727824TUIT004', name: 'ABISHEK B', parent_phone: '9786478493', section: 'III IT E' },
  { roll_no: '727824TUIT005', name: 'ABISHEK R', parent_phone: '9095056349', section: 'III IT E' },
  { roll_no: '727824TUIT006', name: 'ADEEB AHAMED M', parent_phone: '8903413308', section: 'III IT E' },
  { roll_no: '727824TUIT007', name: 'ADHITYA N', parent_phone: '9443745600', section: 'III IT E' },
  { roll_no: '727824TUIT008', name: 'AJAY K', parent_phone: '9382618660', section: 'III IT E' },
  { roll_no: '727824TUIT009', name: 'Alagumaris G', parent_phone: '9047889619', section: 'III IT E' },
  { roll_no: '727824TUIT010', name: 'Amrisha J', parent_phone: '8973820746', section: 'III IT E' },
  { roll_no: '727824TUIT011', name: 'Amritha S', parent_phone: '9965312843', section: 'III IT E' },
  { roll_no: '727824TUIT012', name: 'Anand Sanjay M', parent_phone: '7868086675', section: 'III IT E' },
  { roll_no: '727824TUIT013', name: 'Ananya R', parent_phone: '9443715423', section: 'III IT E' },
  { roll_no: '727824TUIT014', name: 'ANBUSELVAN.B', parent_phone: '9442764007', section: 'III IT E' },
  { roll_no: '727824TUIT015', name: 'Anisha S', parent_phone: '8695376080', section: 'III IT E' },
  { roll_no: '727824TUIT016', name: 'ARASAN R', parent_phone: '8925124068', section: 'III IT E' },
  { roll_no: '727824TUIT017', name: 'INIYABHARATHI M', parent_phone: '9942227987', section: 'III IT E' },
  { roll_no: '727824TUIT018', name: 'Arun Prasath M', parent_phone: '9843247303', section: 'III IT E' },
  { roll_no: '727824TUIT019', name: 'Ashwanth S', parent_phone: '9942775720', section: 'III IT E' },
  { roll_no: '727824TUIT020', name: 'JANANI A', parent_phone: '6381683123', section: 'III IT E' },
  { roll_no: '727824TUIT021', name: 'Aswath S', parent_phone: '9944684142', section: 'III IT E' },
  { roll_no: '727824TUIT022', name: 'Aswen S', parent_phone: '9159170300', section: 'III IT E' },
  { roll_no: '727824TUIT023', name: 'Aswin S', parent_phone: '9003385557', section: 'III IT E' },
  { roll_no: '727824TUIT024', name: 'Athesh S', parent_phone: '6374681581', section: 'III IT E' },
  { roll_no: '727824TUIT025', name: 'Athish D', parent_phone: '9486888654', section: 'III IT E' },
  { roll_no: '727824TUIT026', name: 'Balakmanikandan S S', parent_phone: '9442211279', section: 'III IT E' },
  { roll_no: '727824TUIT027', name: 'Barath S', parent_phone: '9842650825', section: 'III IT E' },
  { roll_no: '727824TUIT028', name: 'Bragadeesh P', parent_phone: '9943715491', section: 'III IT E' },
  { roll_no: '727824TUIT029', name: 'DARSHINI B', parent_phone: '9943137170', section: 'III IT E' },
  { roll_no: '727824TUIT030', name: 'DEEPAK S', parent_phone: '9442211279', section: 'III IT E' },
  { roll_no: '727824TUIT031', name: 'DEEPIKA S S', parent_phone: '9943508753', section: 'III IT E' },
  { roll_no: '727824TUIT032', name: 'DEEPTHASRI S D', parent_phone: '7010639005', section: 'III IT E' },
  { roll_no: '727824TUIT033', name: 'DHANUSHA P', parent_phone: '9965124646', section: 'III IT E' },
  { roll_no: '727824TUIT034', name: 'DHANYASRI J', parent_phone: '9843046578', section: 'III IT E' },
  { roll_no: '727824TUIT035', name: 'DHARRSHINII S U', parent_phone: '9790411155', section: 'III IT E' },
  { roll_no: '727824TUIT036', name: 'DHARSHINI S', parent_phone: '9942033344', section: 'III IT E' },
  { roll_no: '727824TUIT037', name: 'DHARUN PRASATH B', parent_phone: '9865528990', section: 'III IT E' },
  { roll_no: '727824TUIT038', name: 'Dharunika T', parent_phone: '9965569512', section: 'III IT E' },
  { roll_no: '727824TUIT039', name: 'DHISIHARAN P', parent_phone: '6382346425', section: 'III IT E' },
  { roll_no: '727824TUIT040', name: 'DHIYANESHWAR K', parent_phone: '9787240392', section: 'III IT E' },
  { roll_no: '727824TUIT041', name: 'DINESHKUMAR G', parent_phone: '9944154843', section: 'III IT E' },
  { roll_no: '727824TUIT042', name: 'DINESH R S', parent_phone: '8015691803', section: 'III IT E' },
  { roll_no: '727824TUIT043', name: 'DIVYA DHARSHINI M', parent_phone: '8525013270', section: 'III IT E' },
  { roll_no: '727824TUIT044', name: 'DIVYADHARSHINI S', parent_phone: '9442211279', section: 'III IT E' },
  { roll_no: '727824TUIT045', name: 'DIVYASAGAR P', parent_phone: '9840071706', section: 'III IT E' },
  { roll_no: '727824TUIT046', name: 'D EDWIN JOSHUA', parent_phone: '9655280535', section: 'III IT E' },
  { roll_no: '727824TUIT047', name: 'GOKUL S', parent_phone: '9003119826', section: 'III IT E' },
  { roll_no: '727824TUIT048', name: 'GOPINATH K', parent_phone: '8547177517', section: 'III IT E' },
  { roll_no: '727824TUIT049', name: 'GOWSIK B', parent_phone: '9976628739', section: 'III IT E' },
  { roll_no: '727824TUIT050', name: 'GOWTHAM PERIYASAMY S', parent_phone: '9443124662', section: 'III IT E' },
  { roll_no: '727824TUIT051', name: 'GURU VISHAL V S', parent_phone: '6585915716', section: 'III IT E' },
  { roll_no: '727824TUIT052', name: 'GURUCHANDRU S', parent_phone: '8220014301', section: 'III IT E' },
  { roll_no: '727824TUIT053', name: 'HARI DARSHINI K', parent_phone: '9976261189', section: 'III IT E' },
  { roll_no: '727824TUIT054', name: 'Hari Prasath M', parent_phone: '9443201719', section: 'III IT E' },
  { roll_no: '727824TUIT055', name: 'Hariraj V', parent_phone: '6383360382', section: 'III IT E' },
  { roll_no: '727824TUIT056', name: 'HARISH ADITHYA C.K', parent_phone: '9443524633', section: 'III IT E' },
  { roll_no: '727824TUIT057', name: 'HARISH KUMAR S V', parent_phone: '8870621564', section: 'III IT E' },
  { roll_no: '727824TUIT058', name: 'HARSHA S', parent_phone: '9894651881', section: 'III IT E' },
  { roll_no: '727824TUIT059', name: 'INIYA K', parent_phone: '9659840978', section: 'III IT E' },
  { roll_no: '727825TUIT601', name: 'KARTHIK SS', parent_phone: '9791930590', section: 'III IT E' },
  { roll_no: '727825TUIT602', name: 'KIRAN M', parent_phone: '9442211279', section: 'III IT E' },
  { roll_no: '727825TUIT603', name: 'LOGESWARAN R', parent_phone: '9788627430', section: 'III IT E' },
];

async function updateSectionEStudents() {
  try {
    await sequelize.authenticate();
    console.log(`Updating ${updatedStudentsE.length} student records for section III IT E...`);

    for (const st of updatedStudentsE) {
      const [student, created] = await Student.findOrCreate({
        where: { roll_no: st.roll_no },
        defaults: st
      });

      if (!created) {
        await student.update({
          name: st.name,
          section: st.section,
          parent_phone: st.parent_phone || student.parent_phone
        });
      }
    }

    const countE = await Student.count({ where: { section: 'III IT E' } });
    console.log(`Success! Section III IT E updated with ${countE} student records.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating III IT E students:', err);
    process.exit(1);
  }
}

updateSectionEStudents();
