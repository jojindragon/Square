import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../attendBook/attend.css';
import './timetable.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import koLocale from '@fullcalendar/core/locales/ko';


const Timetable = () => {
    // 로그인 시 받은 사용자 정보 상태
    const [userInfo, setUserInfo] = useState({name: '', role: '', username: '', acaId: '', userId: ''});
        const navi = useNavigate();

        useEffect(() => {
            axios.get("/public/user", {withCredentials: true})
                .then(res => {
                    const {name, role, username, acaId, userId} = res.data;
                    setUserInfo({name, role, username, acaId, userId});
                }).catch(() => {
                    navi("/login");
                });
        }, [navi]);

    // 권한에 따른 전용 기능 구현
    //const role = userInfo.role;

    // '일', '주' 중 하나만 선택 =======================================
    const [selectedPeriod, setSelectedPeriod] = useState('주');
    const calendarRef = useRef(null);
    const handlePeriodClick = (period) => {
        if (selectedPeriod === period) {
            setSelectedPeriod(''); // 이미 선택된 버튼은 다시 누르면 해제됨.
        } else {
            setSelectedPeriod(period); // 버튼 선택
            const calendarApi=calendarRef.current?.getApi();
            if(calendarApi){
                calendarApi.changeView(period === '일' ? 'timeGridDay' : 'timeGridWeek');
            }
        }
    };

    //'<', '>' 클릭 이벤트
    const handleDateNavigate = (direction) => {
        const calendarApi = calendarRef.current?.getApi();
        if(!calendarApi) return;

        if(selectedPeriod === '일'){
            if(direction === '<'){
                calendarApi.prev();//이전 날짜
            }else{
                calendarApi.next();//다음 날짜
            }
        }else{
            if(direction==='<'){
                calendarApi.prev();//이전 주
            }else {
                calendarApi.next(); //다음 주
            }
        }
    };

    // 시간표 생성 페이지 이동
    const navigate = useNavigate();
    const handleCreateClick = () => {
        navigate('create-timetable', { state: { acaId: userInfo.acaId } });
    };

    // 시간표 편집 페이지 이동
    const handleEditClick =()=>{
        if(selectedTimetable.length === 0){
            alert('선택된 시간표가 없습니다.');
        }else if(selectedTimetable.length > 1){
            alert('하나의 시간표만 선택해주세요.');
        }else {
            const timetableId = selectedTimetable[0].timetableId;
            navigate('update-timetable',{ state: { timetableId, acaId: userInfo.acaId  } });
        }
    }

    // 시간표 목록 조회 + 선택
    const [timetableList, setTimetableList] = useState([]);
    const [selectedTimetable, setSelectedTimetable]=useState([]);

    useEffect(()=>{
        if(userInfo.acaId){
            axios.get(`/public/timetablelist?academyId=${userInfo.acaId}`)
            .then(res=>{
                setTimetableList(res.data);
                const today = new Date().toISOString().split('T')[0];
                const ongoing = res.data.filter(t => t.endDate >= today);
                setSelectedTimetable(ongoing);
            });
        }
    },[userInfo.acaId]);

    // const handleTimetableSelect=(timetable)=>{
    //     setSelectedTimetable(timetable);
    // }; // 미사용 주석용
    
    //선택된 시간표의 timecontents 조회 + 반복 일정 생성
    const [events, setEvents] =useState([]);
    useEffect(()=>{
        if (selectedTimetable.length === 0) {
            setEvents([]);
            return;
        }

        Promise.all(
            selectedTimetable.map(t =>
                axios.get(`/public/${t.timetableId}/timecontents`).then(res=>({
                    timetable:t,
                    timecontents: res.data,
                }))
            )
        ).then(result=>{
            const allEvents= result.flatMap(({timetable,timecontents})=>
                generateRepeatedEvents(timecontents,timetable.startDate,timetable.endDate)
            );
            setEvents(allEvents);
        });
    },[selectedTimetable]);


    //요일 반복 이벤트 함수 생성
    const generateRepeatedEvents = (timecontents,startDate,endDate)=>{
        const start= new Date(startDate);
        const end = new Date(endDate);
        const events=[];
        
        for(let d=new Date(start); d<=end;d.setDate(d.getDate()+1)){
            const day=d.getDay(); //현재 요일
            const dateStr=d.toISOString().split('T')[0];

            timecontents
            .filter(tc=>tc.dayOfWeek===day)
            .forEach(tc=>{
                let title='';
                if(tc.classId&&tc.className){
                    title=tc.className;
                }else if(!tc.classId && tc.description){
                    title = tc.description;
                }


                events.push({
                    title:title,
                    start: `${dateStr}T${tc.startTime}`,
                    end: `${dateStr}T${tc.endTime}`
                })
            })
        }
        
        return events;
    }

    return (
        <div className='attendContainer'>
            <div className='leftContainer' style={{minWidth:'7%', maxWidth:'15%',width:'auto', flexShrink:'0'}}>
                <span className='attendTitle'> 시간표 </span>
                    
                {/* leftContainer */}
                <div className='radioContainer'>
                    {/* 클래스 목록 반복 리스트 ========================= */}
                    {(()=> {
                        const today =new Date().toISOString().split('T')[0]; //'YYYY-MM-DD'
                        const ongoing =timetableList.filter(t=>t.endDate>=today);
                        const ended=timetableList.filter(t=>t.endDate<today);

                        return(
                            <>
                                {/*진행 중 시간표 */}
                                {ongoing.map(t=>(
                                    <label className="radioItem" key={t.timetableId}>
                                        <input type='checkbox' name='class' checked={selectedTimetable.some(sel => sel.timetableId === t.timetableId)}
                                        onChange={(e)=>{
                                            if(e.target.checked){
                                                setSelectedTimetable(prev=>[...prev,t]);
                                            }else {
                                                setSelectedTimetable(prev => prev.filter(sel => sel.timetableId !== t.timetableId));
                                            }
                                        }}
                                        />
                                        <span className="radioMark"></span>
                                        <span className="radioText">{t.title}</span>
                                    </label>
                                ))}
                                {/*구분선 */}
                                {ended.length>0&&<hr style={{margin:'10px 0', border:'1px solid black', width:'100%'}}/>}
                                {/*종료된 시간표 */}
                                {ended.map(t=>(
                                    <label className="radioItem" key={t.timetableId}>
                                        <input type='checkbox' name='class'
                                        checked={selectedTimetable.some(sel => sel.timetableId === t.timetableId)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedTimetable(prev => [...prev, t]);
                                            } else {
                                                setSelectedTimetable(prev => prev.filter(sel => sel.timetableId !== t.timetableId));
                                            }
                                        }} />
                                        <span className="radioMark"></span>
                                        <span className="radioText" style={{ color: '#aaa' }}>{t.title}</span>
                                    </label>
                                ))}
                            </>
                        );
                    })()}
                </div>

                <div className='buttonsWrapper3'>
                        <button className='time-selectToday' onClick={() => handleDateNavigate()} style={{fontSize:'25px'}}
                        >오늘</button>
                </div>

                <div className='buttonsWrapper2'>
                    {['<', '>'].map((label) => (
                        <button
                            key={label}
                            onClick={() => handleDateNavigate(label)}
                            className='time-prevnextbtn'
                            style={{fontSize:'25px'}}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className='buttonsWrapper2'>
                    {['일', '주'].map((label) => (
                        <button
                            key={label}
                            onClick={() => handlePeriodClick(label)}
                            className={selectedPeriod === label ? 'selectedButton' : ''}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>


            {/* rightContainer - 우측 시간표 영역 */}
            <div className='timetableContainer'>
                {/* 학생 & 학부모는 아래 버튼 렌더링 X */}
                {(userInfo.role !== '학생' && userInfo.role !== '학부모') && (
                    <div className='buttonsWrapper'>
                        <button onClick={handleEditClick}> 편집 </button>
                        <button onClick={handleCreateClick}> 시간표 생성 </button>

                    </div>
                )}

                <div className='timetable'>
                    <FullCalendar
                      plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
                      initialView='timeGridWeek'
                      ref={calendarRef}
                      headerToolbar={false}
                      dayHeaders={true}
                      allDaySlot={false}
                      slotDuration= {'00:10:00'}
                      allDayClassNames={false}
                      nowIndicator={true}
                      height='97%'
                      scrollTime={new Date().toTimeString().slice(0, 8)} //현재시간에 자동으로 포커스
                      locale={koLocale}
                      dayHeaderContent={(args) => { //상단 dayHeader 커스텀
                        const date=args.date;
                        const option={weekday:'long',month:'2-digit',day:'2-digit'};
                        const formatter=new Intl.DateTimeFormat('ko-KR',option);
                        const parts=formatter.formatToParts(date);

                        const weekday=parts.find(p=>p.type==='weekday')?.value;
                        const month=parts.find(p=>p.type==='month')?.value;
                        const day=parts.find(p=>p.type==='day')?.value;

                        return `${weekday} (${month}/${day})`;
                      }}
                      events={events}
                    />
                </div>
            </div>

        </div>
    );
};

export default Timetable;