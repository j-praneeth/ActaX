import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Send, User } from "lucide-react";

export default function MeetingHighlights() {
  const actionPoints = [
    {
      id: 1,
      point: "Naveen Bandari to provide a detailed report on the company's current operations and response to Covid-19.",
      owner: "Naveen Bandari"
    },
    {
      id: 2,
      point: "Establish a regular update schedule for Covid-19 related information sharing within the team.",
      owner: "Naveen Bandari"
    }
  ];

  const topics = [
    {
      id: 1,
      topic: "Company's Response to Covid-19",
      description: "Discussion focused on how the company is handling the ongoing Covid-19 situation, including operational adjustments and monitoring.",
      speaker: "Naveen Bandari"
    }
  ];

  const keyTakeaways = [
    {
      id: 1,
      text: "The company is actively monitoring the situation regarding Covid-19."
    },
    {
      id: 2,
      text: "There is a need for continuous updates and information sharing related to Covid-19 developments."
    }
  ];

  const participants = [
    {
      id: 1,
      name: "Naveen Bandari",
      initials: "NB"
    }
  ];

  const predefinedQuestions = [
    "What is meant by 'a little companyaz' in the transcript?",
    "What are the 'watch screens' referred to in the transcript, and what is their significance?",
    "Who or what does 'the pa' refer to, and what is it supposed to discover?",
    "Is there any context missing from the transcript that could clarify its meaning?",
    "What is the overall topic or theme of the conversation in the transcript?"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MeetingSidebar currentPage="highlights" />
        
        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Meeting Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      The meeting involved a discussion led by Naveen Bandari regarding the company's activities in relation to Covid-19. There were mentions of company operations and the importance of monitoring developments, although the specifics were not clearly articulated in the transcript.
                    </p>
                  </CardContent>
                </Card>

                {/* Action Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Action Points</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">POINT</th>
                            <th className="text-left py-2">OWNER</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {actionPoints.map((point) => (
                            <tr key={point.id} className="border-b">
                              <td className="py-3">{point.id}</td>
                              <td className="py-3">{point.point}</td>
                              <td className="py-3">{point.owner}</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Topics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">TOPIC</th>
                            <th className="text-left py-2">DESCRIPTION</th>
                            <th className="text-left py-2">SPEAKER</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topics.map((topic) => (
                            <tr key={topic.id} className="border-b">
                              <td className="py-3">{topic.id}</td>
                              <td className="py-3">{topic.topic}</td>
                              <td className="py-3">{topic.description}</td>
                              <td className="py-3">{topic.speaker}</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Takeaways */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Key Takeaways</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">TEXT</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keyTakeaways.map((takeaway) => (
                            <tr key={takeaway.id} className="border-b">
                              <td className="py-3">{takeaway.id}</td>
                              <td className="py-3">{takeaway.text}</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Participants ({participants.length})</span>
                      <Button variant="link" size="sm">View All</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{participant.initials}</span>
                          </div>
                          <span className="text-gray-700">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ask Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ask?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predefinedQuestions.map((question, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{question}</span>
                            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 transform rotate-45"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Ask anything about meeting..." 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
