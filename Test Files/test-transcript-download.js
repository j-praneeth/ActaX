// Test downloading the actual transcript
async function testTranscriptDownload() {
  const RECALL_API_KEY = '32bd623de16c5e9a4520ed8c42085f3f9f9ceccd';
  const botId = '5cc7990d-9d28-4334-a9b7-12fd1ec11d09';
  
  console.log('📥 Testing Transcript Download');
  console.log('=============================');
  
  try {
    // Get bot info
    const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${botId}`, {
      headers: {
        'Authorization': `Token ${RECALL_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Bot API failed: ${response.status}`);
    }
    
    const botData = await response.json();
    const recording = botData.recordings[0];
    const transcriptShortcut = recording.media_shortcuts.transcript;
    const downloadUrl = transcriptShortcut.data.download_url;
    
    console.log('📄 Downloading transcript from URL...');
    
    // Download the transcript (pre-signed URL doesn't need auth header)
    const transcriptResponse = await fetch(downloadUrl);
    
    console.log(`📡 Transcript download status: ${transcriptResponse.status}`);
    
    if (transcriptResponse.ok) {
      const transcriptData = await transcriptResponse.json();
      console.log('\n✅ Transcript Downloaded Successfully!');
      console.log('📊 Full Transcript Data:');
      console.log(JSON.stringify(transcriptData, null, 2));
      
      console.log('\n🔍 Data Analysis:');
      console.log('Type:', typeof transcriptData);
      console.log('Is Array:', Array.isArray(transcriptData));
      
      if (Array.isArray(transcriptData) && transcriptData.length > 0) {
        console.log('First element:', transcriptData[0]);
        console.log('Keys in first element:', Object.keys(transcriptData[0]));
        
        // Try to extract text from the array
        let fullTranscript = '';
        transcriptData.forEach((item, index) => {
          if (item.text) {
            fullTranscript += item.text + ' ';
          }
          if (index < 3) {
            console.log(`Item ${index}:`, item);
          }
        });
        
        console.log('\n📝 Extracted full transcript:');
        console.log(fullTranscript.trim());
      }
      
    } else {
      const errorText = await transcriptResponse.text();
      console.log(`❌ Failed to download transcript: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTranscriptDownload().catch(console.error); 