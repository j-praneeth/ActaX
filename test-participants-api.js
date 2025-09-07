// Test the participants API implementation
const RECALL_API_KEY = '32bd623de16c5e9a4520ed8c42085f3f9f9ceccd';
const botId = '5cc7990d-9d28-4334-a9b7-12fd1ec11d09';

async function testParticipantsAPI() {
  console.log('👥 Testing Participants API Implementation');
  console.log('==========================================');
  
  try {
    // Test 1: Get bot info to check for participants data
    console.log('1. Getting bot info...');
    const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${botId}`, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Bot API failed: ${response.status}`);
    }
    
    const botData = await response.json();
    console.log(`✅ Bot info retrieved: status=${botData.status}`);
    
    // Check if recordings are available
    if (!botData.recordings || botData.recordings.length === 0) {
      console.log('❌ No recordings available');
      return;
    }
    
    const latestRecording = botData.recordings[botData.recordings.length - 1];
    console.log(`✅ Found recording: ${latestRecording.id}`);
    
    // Check for participants in media_shortcuts
    if (latestRecording.media_shortcuts?.participants) {
      const participantsShortcut = latestRecording.media_shortcuts.participants;
      console.log(`✅ Found participants shortcut:`, {
        id: participantsShortcut.id,
        status: participantsShortcut.status?.code,
        hasDownloadUrl: !!participantsShortcut.data?.download_url
      });
      
      if (participantsShortcut.data?.download_url) {
        console.log('2. Downloading participants data...');
        const participantsResponse = await fetch(participantsShortcut.data.download_url);
        
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          console.log('\n✅ PARTICIPANTS DATA DOWNLOADED SUCCESSFULLY!');
          console.log('📊 Participants Data:');
          console.log(JSON.stringify(participantsData, null, 2));
          
          console.log('\n🔍 Data Analysis:');
          console.log('Type:', typeof participantsData);
          console.log('Is Array:', Array.isArray(participantsData));
          console.log('Number of participants:', participantsData.length);
          
          if (Array.isArray(participantsData) && participantsData.length > 0) {
            console.log('\n👥 Participant Details:');
            participantsData.forEach((participant, index) => {
              console.log(`\nParticipant ${index + 1}:`);
              console.log(`  ID: ${participant.id}`);
              console.log(`  Name: ${participant.name}`);
              console.log(`  Is Host: ${participant.is_host}`);
              console.log(`  Platform: ${participant.platform}`);
              console.log(`  Email: ${participant.email || 'N/A'}`);
              if (participant.extra_data?.zoom) {
                console.log(`  Zoom Data:`, participant.extra_data.zoom);
              }
            });
            
            // Count hosts vs members
            const hosts = participantsData.filter(p => p.is_host);
            const members = participantsData.filter(p => !p.is_host);
            console.log(`\n📊 Summary:`);
            console.log(`  Total Participants: ${participantsData.length}`);
            console.log(`  Hosts: ${hosts.length}`);
            console.log(`  Members: ${members.length}`);
          }
        } else {
          console.log(`❌ Failed to download participants: ${participantsResponse.status}`);
        }
      } else {
        console.log('❌ No participants download URL available');
      }
    } else {
      console.log('❌ No participants shortcut found in media_shortcuts');
      console.log('Available shortcuts:', Object.keys(latestRecording.media_shortcuts || {}));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testParticipantsAPI().catch(console.error);
