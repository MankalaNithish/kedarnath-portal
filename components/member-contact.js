import styles from '@/styles/Home.module.css';
import { Avatar } from '@mui/material';

export default function MemberContact({ member, avatar }) {
    let avatarDiv = <></>;
    if (avatar) {
        avatarDiv = <div className={styles.avatar}>
                        <Avatar src={member.picName ? `/profiles/${member.picName}.jpg` : ''}
                            alt={member.name}
                        ></Avatar>
                    </div>;
    }
    return (
        <div className={styles.card}>
            {avatarDiv}
            <div className={styles.membertext}>
                <div className={styles.designation}>{member.name}</div>
                <div className={styles.mb1} >{member.designation}</div>
                <div className={styles.mb1}>Cell: {member.phone}</div>
                <div className={styles.mb1}>Place: {member.place}</div>
            </div>
        </div>
    )
}