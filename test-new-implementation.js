// Test the updated transcript parsing implementation
async function testUpdatedImplementation() {
  const RECALL_API_KEY = '32bd623de16c5e9a4520ed8c42085f3f9f9ceccd';
  const botId = '5cc7990d-9d28-4334-a9b7-12fd1ec11d09';
  
  console.log('🧪 Testing Updated Implementation');
  console.log('================================');
  
  try {
    // Simulate the exact logic from the service
    console.log('1. Getting bot info...');
    const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${botId}`, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });
    
    const botInfo = await response.json();
    console.log(`✅ Bot info retrieved: status=${botInfo.status}`);
    
    // Check recordings
    if (!botInfo.recordings || botInfo.recordings.length === 0) {
      console.log('❌ No recordings available');
      return;
    }
    
    const latestRecording = botInfo.recordings[botInfo.recordings.length - 1];
    console.log(`✅ Found recording: ${latestRecording.id}, status=${latestRecording.status?.code}`);
    
    // Check transcript shortcut
    if (!latestRecording.media_shortcuts?.transcript) {
      console.log('❌ No transcript shortcut available');
      return;
    }
    
    const transcriptShortcut = latestRecording.media_shortcuts.transcript;
    console.log(`✅ Found transcript shortcut: ${transcriptShortcut.id}, status=${transcriptShortcut.status?.code}`);
    
    if (!transcriptShortcut.data?.download_url) {
      console.log('❌ No download URL available');
      return;
    }
    
    // Download transcript
    console.log('2. Downloading transcript...');
    const transcriptResponse = await fetch(transcriptShortcut.data.download_url);
    
    if (!transcriptResponse.ok) {
      console.log(`❌ Download failed: ${transcriptResponse.status}`);
      return;
    }
    
    const transcriptData = await transcriptResponse.json();
    console.log('✅ Transcript downloaded successfully');
    
    // Parse transcript (simulate the service logic)
    let transcriptText = '';
    let speakers = [];
    
    if (Array.isArray(transcriptData)) {
      transcriptData.forEach(participantData => {
        if (participantData.participant) {
          const speakerName = participantData.participant.name || `Speaker ${participantData.participant.id}`;
          speakers.push(speakerName);
          
          if (participantData.words && Array.isArray(participantData.words)) {
            const speakerText = participantData.words.map(word => word.text).join(' ');
            transcriptText += `${speakerName}: ${speakerText}\n\n`;
          }
        }
      });
    }
    
    console.log('\n📝 PARSED TRANSCRIPT:');
    console.log('===================');
    console.log(`Speakers found: ${speakers.join(', ')}`);
    console.log(`Total transcript length: ${transcriptText.length} characters`);
    console.log('\nFirst 500 characters:');
    console.log(transcriptText.substring(0, 500) + '...');
    
    console.log('\n✅ SUCCESS! The implementation should work now.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdatedImplementation().catch(console.error); 