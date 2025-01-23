
"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [subject, setSubject] = useState("");
  const [areasToImprove, setAreasToImprove] = useState("");
  const [time, setTime] = useState("");
  const [standard, setStandard] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    // Function to dynamically load the jspdf library
        const loadJsPDF = () => {
             return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.async = true;
                script.onload = () => resolve(window.jspdf); // Resolve with the jspdf object
                document.body.appendChild(script);
            });
        };


        // Load jspdf when the component mounts
        let jspdfPromise;

         if (typeof window !== 'undefined' && !window.jspdf) {
             jspdfPromise = loadJsPDF()
        }
    }, []);



    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try{
        const response = await fetch('/api/generatePlan',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                areasToImprove,
                time,
                standard
            })
        })
        if (response.ok){
            const data = await response.json()
           
            // Parse the plan into a structured format
             const parsedPlan = parseStudyPlan(data.studyPlan);
            setStudyPlan(parsedPlan);
           
        } else {
            console.error("Error fetching the plan")
            setStudyPlan("Error generating study plan")
        }
    }
    catch(error){
        console.error("Error submitting form", error)
        setStudyPlan("Error generating study plan")
    } finally{
        setLoading(false)
    }
    
    };

    const parseStudyPlan = (plan) => {
      if (!plan) return [];
        const lines = plan.split('\n').filter(line => line.trim() !== '');

        const planArray = [];
        let dayCount = 0;
        for (let i = 0; i < lines.length; i++) {
             const line = lines[i];
             const dayMatch = line.match(/^(Day \d+):?$/i);

            if (dayMatch) {
                dayCount++;
                 planArray.push({
                    type: 'day-separator',
                     day: dayMatch[1],
                 });
                continue;
             }
           const parts = lines[i].split(/[:.]\s+/);
            if(parts.length >1){
              planArray.push({
                  type: 'topic-detail',
                 topic : parts[0].trim(),
                 details: parts.slice(1).join(":").trim()
             })
            }
            else {
               planArray.push({
                   type:'topic-detail',
                    topic: "Note",
                    details: parts.join(":").trim()
                })
            }
           
        }
       return planArray;
    };


  const handleDownloadPDF = () => {
       if (typeof window !== 'undefined' && window.jspdf) {
        const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let yPosition = 20;

            // Add title
            doc.setFontSize(20);
            doc.text('AI-Powered Study Planner', 10, yPosition);
            yPosition += 15;

            // Add form details
            doc.setFontSize(12);
            doc.text(`Subject: ${subject}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Grade Level: ${standard}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Areas to Improve: ${areasToImprove}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Available Study Time: ${time}`, 10, yPosition);
            yPosition += 15;

             doc.setFontSize(16);
             doc.text("Your Personalized Study Plan", 10, yPosition);
             yPosition += 10;

            // Function to add plan to doc
            const addPlanToDoc = (plan) => {
                plan.forEach(item => {
                    if (item.type === 'day-separator') {
                        doc.setFontSize(14);
                        doc.text(item.day, 10, yPosition);
                        yPosition += 10;

                        doc.setLineWidth(0.5);
                        doc.line(10, yPosition-2, 200,yPosition-2);
                        yPosition += 5
                    } else if (item.type === 'topic-detail') {
                      doc.setFontSize(12);
                        doc.text(`- ${item.topic}: `, 15, yPosition);
                        doc.setFontSize(10);
                      const textLines = doc.splitTextToSize(item.details, 170);
                      let lineYPosition = yPosition;
                      textLines.forEach((line, index) => {
                         doc.text(line, 50, lineYPosition );
                         lineYPosition += 6;
                      });
                       yPosition = lineYPosition;
                    }
                        if(yPosition > 280){
                          doc.addPage();
                          yPosition = 20;
                        }
                 });
            };


           if (typeof studyPlan !== 'string') {
               addPlanToDoc(studyPlan);
           } else {
              doc.setFontSize(12);
               const textLines = doc.splitTextToSize(studyPlan,180);
                 textLines.forEach((line, index) => {
                      doc.text(line, 10, yPosition)
                      yPosition += 8;
                   });
           }

        doc.save('study-plan.pdf');
      }
  };

    const isPlanGenerated = !!studyPlan;

  return (
      <div className="app-container">
          <header className="header">
               <div className="icon">🧠</div>
              <h1 className="main-title">AI-Powered Study Planner</h1>
              <p className="sub-title">Create a personalized study plan tailored to your needs</p>
          </header>

      <div className="container">
          <form onSubmit={handleSubmit} className="form">
             <div className="form-row">
                 <div className="form-group">
                     <label htmlFor="subject">
                         <span className="input-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm6 3h2v8h-2V8z"/>
                            </svg>
                         </span>
                         Subject
                     </label>
                    <input 
                        type="text" 
                        id="subject" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        placeholder="e.g., Mathematics"
                        required 
                     />
                 </div>
                 <div className="form-group">
                    <label htmlFor="standard">
                        <span className="input-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M12 2L1 9l2 1 2.5-2.25V22h13V7.75L21 10l2-1zM17 20H7V9.3l5-4.5 5 4.5z"/>
                            </svg>
                        </span>
                        Grade Level
                    </label>
                    <input
                        type="text"
                        id="standard"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        placeholder="e.g., Grade 10"
                        required
                    />
                 </div>
             </div>

             <div className="form-group">
                <label htmlFor="areasToImprove">
                    <span className="input-icon">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                           <path d="M12 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-12a7 7 0 1 1 0 14 7 7 0 0 1 0-14z"/>
                         </svg>
                    </span>
                   Areas to Improve
                </label>
                <input
                     type="text"
                     id="areasToImprove"
                     value={areasToImprove}
                     onChange={(e) => setAreasToImprove(e.target.value)}
                     placeholder="e.g., Algebra, Geometry, Trigonometry"
                     required
                />
            </div>
            <div className="form-group">
                <label htmlFor="time">
                     <span className="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                             <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-5-7h4V6h-4v7zm10 0h4V6h-4v7z"/>
                         </svg>
                    </span>
                    Available Study Time
                </label>
                <input
                    type="text"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 2 hours per day"
                    required
                />
            </div>
             <button type="submit" disabled={loading} className="submit-button">{loading ? 'Generating...' : 'Generate Study Plan'}</button>
         </form>
      {studyPlan && typeof studyPlan !== 'string' && (
              <div className="study-plan">
                  <h2 className="plan-title">Your Personalized Study Plan</h2>
                   <table className="study-table">
                      <thead>
                      <tr>
                          <th>Topic</th>
                          <th>Details</th>
                      </tr>
                      </thead>
                      <tbody>
                          {studyPlan.map((item, index) => (
                            item.type === 'day-separator' ? (
                                    <tr key={index}><td colSpan="2" className="day-separator">{item.day}</td></tr>
                              ) :(
                              <tr key={index}>
                                <td className="topic-column">{item.topic}</td>
                                <td className="details-column">{item.details}</td>
                             </tr>
                                )
                           ))}
                       </tbody>
                  </table>
               </div>
      )}
         {studyPlan && typeof studyPlan === 'string' && (
             <div className="study-plan">
                <pre className="plan-pre">{studyPlan}</pre>
              </div>
        )}
       {isPlanGenerated &&(
            <button onClick={handleDownloadPDF} className="download-button">Download PDF</button>
        )}

        </div>
      <style jsx>{`
          .app-container {
            display: flex;
            flex-direction: column;
            align-items: center;
             padding: 20px;
            background-color: #f5f8fa;
           
        }

        .header {
             display: flex;
            flex-direction: column;
             align-items: center;
            text-align: center;
            margin-bottom: 30px;
        }

         .icon {
             font-size: 2.5em;
             margin-bottom: 0.5em;
           color: #3498db
        }


        .main-title {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            letter-spacing: 0.8px;
           
        }

        .sub-title {
           font-size: 0.9rem;
            color: #777;
            margin-top: 5px;
        }

        .container {
          max-width: 850px; /* Increased max-width */
          margin: 0 auto;
          padding: 25px;
           border-radius: 12px;
           background-color: #fff;
           transition: box-shadow 0.3s ease;
           border: 1px solid #ddd;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }


      .form {
            display: flex;
            flex-direction: column;
            gap: 15px;
       }

        .form-row{
            display: flex;
            gap: 20px;
        }
         .form-row .form-group{
           width: 50%;
          }
      
        .form-group {
            display: flex;
             flex-direction: column;
            margin-bottom: 15px;
        }
      
      .form-group label{
           display: flex;
            align-items: center;
             margin-bottom: 8px;
            font-weight: 500;
            color: #444;
             gap: 5px;
       }
    .input-icon svg {
            margin-right: 4px;
           }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
             font-size: 1rem;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
            color: #333;
            background-color: #f8f8f8;

        }
        .form-group input[type="text"]::placeholder,
          .form-group input[type="number"]::placeholder,
        .form-group textarea::placeholder{
           color: #aaa;
        }

        .form-group input[type="text"]:focus,
         .form-group input[type="number"]:focus,
        .form-group textarea:focus {
            border-color: #5dade2;
            outline: none;
            box-shadow: 0 0 4px rgba(93, 173, 226, 0.3);
        }
      
    .submit-button {
       background-color: #3498db;
         color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 6px;
         cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s ease;
         margin-top: 10px;
        font-size: 1rem;
        width: fit-content;
         align-self: center;
    }

    .submit-button:hover {
        background-color: #2980b9;
    }
    

    .study-plan {
        margin-top: 30px;
        padding: 20px;
        background-color: #f8f8f8;
       border-radius: 10px;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    
      .plan-title {
        text-align: center;
        font-size: 1.8rem;
       margin-bottom: 20px;
        color: #27ae60; /* Changed color */
      }

        .study-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
        }

        .study-table th,
        .study-table td {
            padding: 12px 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }

        .study-table th {
            background-color: #ecf0f1;
             color: #444;
            font-weight: 500;
        }
    
        .study-table tbody tr:last-child td{
         border-bottom: none;
    }
    
          .day-separator{
           text-align: center;
            font-weight: bold;
            padding: 15px 0;
           border-bottom: 2px solid #ddd;
          }
    
        .topic-column {
            font-weight: bold;
            color: #34495e; /* Different color for topic */
             font-size: 1.1rem; /* Increased font size */
         }

        .details-column {
          color: #555; /* Different color for details */
        }
        
      .download-button {
       background-color: #2ecc71;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s ease;
       margin-top: 20px;
        font-size: 1rem;
       width: fit-content;
        align-self: center;
     }

     .download-button:hover {
        background-color: #27ae60;
     }

        
    .plan-pre {
         white-space: pre-wrap;
        background-color: #f0f0f0;
       padding: 15px;
         border-radius: 8px;
        line-height: 1.6;
       color: #555;
         overflow-x: auto;
       }
    `}
      </style>
      </div>
  );
}


