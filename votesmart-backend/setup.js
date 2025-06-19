const mongoose = require('mongoose');
const User = require('./models/user');
const Nominee = require('./models/nominee');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/votesmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected for setup');
  setupDatabase();
}).catch((err) => console.error('MongoDB connection error:', err));

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create default admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default admin user created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample nominees
    const nomineesCount = await Nominee.countDocuments();
    if (nomineesCount === 0) {
      const sampleNominees = [
        {
          name: 'John Doe',
          imageUrl: 'uploads/sample1.jpg',
          votes: 0
        },
        {
          name: 'Jane Smith',
          imageUrl: 'uploads/sample2.jpg',
          votes: 0
        },
        {
          name: 'Mike Johnson',
          imageUrl: 'uploads/sample3.jpg',
          votes: 0
        }
      ];

      await Nominee.insertMany(sampleNominees);
      console.log('✅ Sample nominees created');
    } else {
      console.log('✅ Nominees already exist');
    }

    // Create sample users
    const usersCount = await User.countDocuments({ role: 'user' });
    if (usersCount === 0) {
      const sampleUsers = [
        {
          username: 'user1',
          password: 'password123',
          role: 'user'
        },
        {
          username: 'user2',
          password: 'password123',
          role: 'user'
        }
      ];

      await User.insertMany(sampleUsers);
      console.log('✅ Sample users created:');
      console.log('   user1 / password123');
      console.log('   user2 / password123');
    } else {
      console.log('✅ Users already exist');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\nDefault credentials:');
    console.log('Admin: admin / admin123');
    console.log('Users: user1 / password123, user2 / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
} 