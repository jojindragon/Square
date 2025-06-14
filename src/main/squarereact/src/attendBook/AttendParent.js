import React, { useEffect, useRef } from 'react';
// import React, { useState } from 'react'; - build test
import './attend.css';
import './attendStu.css';
import './attendParent.css';
import ApexCharts from 'apexcharts';
import { attendanceChartOptions  } from './attendanceChartOptions';

const AttendParent = () => {
    // 당일 출석 날짜 출력
    const getTodayDate = () => {
        const today = new Date();
        const year = String(today.getFullYear()).slice(2); // '25'
        const month = String(today.getMonth() + 1).padStart(2, '0'); // '05'
        const date = String(today.getDate()).padStart(2, '0'); // '19'
        return `${year}.${month}.${date} 출석`;
    };

    const chartRef = useRef(null);

    // 누적 출석 차트
    useEffect(() => {
        if (chartRef.current) {
        const chart = new ApexCharts(chartRef.current, attendanceChartOptions );
        chart.render();

        // 언마운트 시 chart 파괴
        return () => chart.destroy();
        }
    }, []);
    
    // (임시) 지난 출석 날짜 출력 (임시) ================================================
    const attendList = [
        {
            dateText: '25.05.09 금요일 출석',
            dateOnly: '25.05.09 금요일',
            present: 12,
            late: 2,
            absent: 1,
        },
        {
            dateText: '25.05.08 목요일 출석',
            dateOnly: '25.05.08 목요일',
            present: 13,
            late: 1,
            absent: 1,
        }
    ];

    // (임시) 입력 활성화 여부 상태 (임시) aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    // const [isEditable, setIsEditable] = useState(false);
    getTodayDate(); // 빌드 테스트를 위해 주석 및 임시 사용 - 개발하시면서 지워도 됨

    return (
            <div className='attendContainer'>
                
                <div className='leftContainer3'>
                    {/* 오늘의 출석 ==================================================== */}
                    <span className='attendTitle'> 오늘의 출석 </span>
                    {/* 지금 수업은 ~입니다. */}
                    <div className='todayAttendTitle3'>
                        <span> 지금 수업은 </span>
                        <span style={{fontSize:'25px', color:'#2E5077', fontWeight:'800'}}> 
                            (수업 시간표) 
                        </span>
                        <span> 입니다. </span> <br/>
                    </div>

                    {/* 해당 자녀의 누적 출석률 */}
                    <div className='mystackAttend'>
                        여기다 뭐 넣냐 
                    </div>
                </div>


                <div className='rightContainer'>
                    {/* 우리 반 누적 출석률 =========================================== */}
                    <span className='attendTitle'> 우리 반 누적 출석률 </span>
                    <div className='stackAttend'>
                        {/* 원형 그래프 */}
                        <div className='attendGraph' ref={chartRef}></div>

                        {/* 반 누적 % */}
                        <div className='attendClass'>  
                            <span style={{fontSize:'25px', color:'#2E5077', fontWeight:'700'}}> 우리 반 누적 출석률은 </span> &nbsp;        
                            <span style={{fontSize:'25px', color:'#79D7BE', fontWeight:'800'}}> (수치)% </span> &nbsp;                               
                            <span style={{fontSize:'25px', color:'#2E5077', fontWeight:'700'}}> ! </span>
                            
                            <div className="attenderWrapper">
                                <div className='attender'>
                                    <span className='attenderTitle'> 이번 달 출석왕 </span> <br />
                                    <span className='attenderName'> (학생명) </span>
                                </div>

                                <div className='attender'>
                                    <span className='attenderTitle'> 이번 달 분발왕 </span> <br />
                                    <span className='attenderName'> (학생명) </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 지난 출석 ==================================================== */}
                    <span className='attendTitle'> 지난 출석 </span>
                    <div className='historyAttend'>
                        {/* 반복 처리 리스트 */}
                        {attendList.map((attend, index) => (
                        <div className='historyList' key={index}>
                        <div>
                            <span style={{ fontSize: '23px', color: '#2E5077', fontWeight: '700', display: 'inline-block', marginRight: '20px' }}>
                            ({attend.dateText})
                            </span>

                            <span style={{ display: 'inline-block', marginRight: '10px' }}>
                            <i className="bi bi-circle-fill" style={{ color: '#79D7BE' }}></i>
                            <span className='historyCount'> ({attend.present}) </span>
                            </span>

                            <span style={{ display: 'inline-block', marginRight: '10px' }}>
                            <i className="bi bi-triangle-fill" style={{ color: '#FFB83C' }}></i>
                            <span className='historyCount'> ({attend.late}) </span>
                            </span>
                            
                            <span style={{ display: 'inline-block' }}>
                            <i className="bi bi-x-lg" style={{ color: '#D85858' }}></i>
                            <span className='historyCount'> ({attend.absent}) </span>
                            </span>
                        </div>

    </div>
    ))}
                    </div>
                </div>
                
            </div>
    );
};  

export default AttendParent;