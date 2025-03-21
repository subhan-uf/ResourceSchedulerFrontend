import React from "react";
import { Image, PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import ReactDOM from "react-dom";

const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    table: { display: "flex", flexDirection: "column", borderWidth: 1 },
    row: { flexDirection: "row" },
    cell: { 
        borderWidth: 1, 
        width: '13%', 
        padding: 0, 
        fontSize: 10,
        minHeight: 20,
        textAlign: 'center'
    },
    header: { 
        fontWeight: 'bold', 
        backgroundColor: '#28282B',  // Changed to black
        color: 'white'  // Added white text
    },
    timeCell: { width: '23%', padding: 5, fontSize: 10 },
    breakRow: { 
        backgroundColor: '#28282B',  // Changed to black
        flexDirection: 'row',
        alignItems: 'center',
        color: 'white'  // Set text color for entire row
    },
    breakCell: {
        width: '100%',
        textAlign: 'center',
        padding: 5,
        fontSize: 10,
        color: 'white'  // Explicit white text
    },
    courseTable: { marginTop: 20 },
    courseHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' }
});

export const PdfGenerator = {
    generate: (timetableData, window) => {
        // Get unique courses
        // const courses = Object.values(timetableData.courseData);

        const MyDocument = () => (
            <Document>
        
                {timetableData.timetables.map((timetable, index) => (
                    <Page key={index} size="A4" style={styles.page}>
     <Image
  src="/nedlogo.png"
  style={{
    position: 'absolute',
    top: 30,
    right: 30,
    width: 50,
    height: 50,
  }}
/>

                        {/* Timetable Section */}
                        <Text style={{ fontSize: 18, marginBottom: 35, textAlign: 'center', marginTop: 45 }}>
                        <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
  TIME TABLE FOR BACHELORS DEGREE PROGRAMMES{'\n'}
  DEPARTMENT OF COMPUTER SCIENCE & INFORMATION TECHNOLOGY{'\n'}
  {(() => {
    const [batchName, batchYear] = timetable.batch.split(' ');
    return `TIME TABLE FOR ${2025 - parseInt(batchYear)}th Year ${batchName} Spring 2025, BATCH ${batchYear}`;
  })()}{'\n'}
  EFFECTIVE DATE: 06 January, 2025
</Text>

                        </Text>
                        
                        {/* Theory Room Numbers */}
                        <View style={[styles.row, styles.header]}>
                            <Text style={[styles.timeCell, styles.header]}> {timetable.section}</Text>
                            <Text style={[styles.cell, { width: '100%', textAlign: 'center' }]}>
                                Theory Room: {timetable.room}
                            </Text>
                        </View>
        
                        {/* Timetable Header */}
                        <View style={[styles.row, styles.header]}>
                            <Text style={[styles.timeCell, styles.header]}>Time</Text>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <Text key={day} style={[styles.cell, styles.header]}>{day}</Text>
                            ))}
                        </View>
        
                        {/* Timetable Rows */}
                        {timetable.structure.map((slot, index) => {
                            if (slot.isBreak) {
                                return (
                                    <View key={index} style={[styles.row, styles.breakRow]}>
                                        <Text style={styles.timeCell}>{slot.time}</Text>
                                        <Text style={styles.breakCell}>{slot.label}</Text>
                                    </View>
                                );
                            }
                            
                            const courses = timetable.courses[slot.time] || Array(6).fill('');
                            
                            return (
                                <View key={index} style={styles.row}>
                                    <Text style={styles.timeCell}>{slot.time}</Text>
                                    {courses.map((courseShort, dayIdx) => (
                                        <Text key={dayIdx} style={styles.cell}>
                                            {courseShort || ''}
                                        </Text>
                                    ))}
                                </View>
                            );
                        })}
        
                        {/* Course Key Table */}
                        <View style={styles.courseTable}>
                            
                            
                            {/* Course Table Header */}
                            <View style={[styles.row, styles.courseHeader]}>
                                <Text style={[styles.cell, { width: '25%' }]}>Code</Text>
                                <Text style={[styles.cell, { width: '30%' }]}>Course Title</Text>
                                <Text style={[styles.cell, { width: '20%' }]}>Abbreviation</Text>
                                <Text style={[styles.cell, { width: '25%' }]}>Teacher</Text>
                            </View>
        
                            {/* Course Table Rows */}
                            {timetable.courseData.map((course, index) => {                                const hasBothTypes = course.teachers.theory && course.teachers.lab;
                                const sameTeacher = course.teachers.theory === course.teachers.lab;
                                
                                return (
                                    <View key={index} style={styles.row}>
                                        <Text style={[styles.cell, { width: '25%' }]}>{course.code}</Text>
                                        <Text style={[styles.cell, { width: '30%' }]}>
                                            {course.fullName} ({course.creditHours - course.labHours}+{course.labHours})
                                        </Text>
                                        <Text style={[styles.cell, { width: '20%' }]}>{course.shortForm}</Text>
                                        <Text style={[styles.cell, { width: '25%' }]}>
                                            {sameTeacher ? (
                                                `${course.teachers.theory} (Thr + Pr)`
                                            ) : (
                                                <>
                                                    {course.teachers.theory && `${course.teachers.theory} (Thr)\n`}
                                                    {course.teachers.lab && `${course.teachers.lab} (Pr)`}
                                                </>
                                            )}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={{
  position: 'absolute',
  bottom: 30,
  left: 30,
  right: 30,
  flexDirection: 'row',
  justifyContent: 'space-between'
}}>
  {/* Left corner */}
  <View>
  <Text style={{ fontSize: 16 }}>Reviewed by : _____________</Text>
  <Text style={{ fontSize: 16 }}>Class Advisor: _____________</Text>
    <Text style={{ fontSize: 16 }}>Date: _____________</Text>
  </View>

  {/* Right corner */}
  <View>
    <Text style={{ fontSize: 16 }}>Approved by : _____________</Text>
    <Text style={{ fontSize: 16 }}>Chairman: _____________</Text>
    <Text style={{ fontSize: 16 }}>Date: _____________</Text>
  </View>
</View>
                    </Page>
                ))}
            </Document>
        );

        const link = (
            <PDFDownloadLink document={<MyDocument />} fileName="timetable.pdf">
                {({ blob, url, loading, error }) => {
                    if (url) {
                        window.location.href = url;
                    }
                    return loading ? 'Generating PDF...' : '';
                }}
            </PDFDownloadLink>
        );
        
        const tempDiv = window.document.createElement('div');
        window.document.getElementById('pdf-content').appendChild(tempDiv);
        ReactDOM.render(link, tempDiv);
    }
};